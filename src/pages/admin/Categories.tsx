import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types/database'

export default function AdminCategories() {
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  const { data: categories, isLoading } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminGetCategories })
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', description: '', is_active: true } })

  const save = useMutation({
    mutationFn: async (data: { name: string; description?: string; is_active: boolean }) => {
      if (editing) return adminUpdateCategory(editing.id, data)
      return adminCreateCategory(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success(editing ? 'Updated' : 'Created')
      setShowForm(false); setEditing(null); reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); toast.success('Deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  const openEdit = (c: Category) => {
    setEditing(c)
    reset({ name: c.name, description: c.description || '', is_active: c.is_active })
    setShowForm(true)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal-900">Categories</h1>
        <Button onClick={() => { setEditing(null); reset({ name: '', description: '', is_active: true }); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="bg-white rounded-xl border p-4 space-y-3 max-w-md">
          <div className="space-y-1"><Label>Name</Label><Input {...register('name', { required: true })} /></div>
          <div className="space-y-1"><Label>Description</Label><Input {...register('description')} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_active')} className="rounded" /> Active</label>
          <div className="flex gap-2">
            <Button type="submit" loading={save.isPending} size="sm">Save</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      {isLoading ? <div className="animate-pulse h-32 bg-charcoal-100 rounded-xl" /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 text-left"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Slug</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y">
              {categories?.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-charcoal-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-charcoal-100'}`}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => confirm('Delete?') && del.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
