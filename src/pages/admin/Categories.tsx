import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types/database'

export default function AdminCategories() {
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminGetCategories,
  })
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', description: '', is_active: true },
  })

  const save = useMutation({
    mutationFn: async (data: { name: string; description?: string; is_active: boolean }) => {
      if (editing) return adminUpdateCategory(editing.id, data)
      return adminCreateCategory(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success(editing ? 'Updated' : 'Created')
      setShowForm(false)
      setEditing(null)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast.success('Deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openEdit = (c: Category) => {
    setEditing(c)
    reset({ name: c.name, description: c.description || '', is_active: c.is_active })
    setShowForm(true)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-full overflow-x-hidden pb-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">Categories</h1>
        <Button
          size="sm"
          className="rounded-full h-9 shrink-0"
          onClick={() => {
            setEditing(null)
            reset({ name: '', description: '', is_active: true })
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="bg-white rounded-xl border border-charcoal-100 p-4 space-y-3 w-full max-w-md"
        >
          <div className="space-y-1">
            <Label>Name</Label>
            <Input className="h-11 rounded-xl" {...register('name', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input className="h-11 rounded-xl" {...register('description')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} className="rounded" /> Active
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={save.isPending} size="sm" className="rounded-full">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="animate-pulse h-32 bg-charcoal-100 rounded-xl" />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {categories?.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-charcoal-100 p-3 flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-charcoal-900 text-sm">{c.name}</p>
                  <p className="text-[10px] font-mono text-charcoal-400 truncate">{c.slug}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                      c.is_active ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-red-600 border-red-200"
                    onClick={() => confirm('Delete this category?') && del.mutate(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {categories?.length === 0 && (
              <p className="text-center text-charcoal-500 py-10 text-sm">No categories</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories?.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-charcoal-500 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.is_active ? 'bg-green-100 text-green-700' : 'bg-charcoal-100'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => confirm('Delete?') && del.mutate(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
