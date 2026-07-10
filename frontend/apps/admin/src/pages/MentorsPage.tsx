import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";
import { apiClient, getErrorMessage } from "@itp/utils";
import { Button, Input, Table, Badge, Modal, SkeletonTable, ErrorState } from "@itp/ui";

interface Mentor {
  id: string;
  name: string;
  email: string;
  emp_id: string;
  is_active: boolean;
  assignments: { track_id: string; start_idx: number; end_idx: number }[];
}

interface Track {
  id: string;
  name: string;
  code: string;
}

const mentorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  emp_id: z.string().min(2),
  phone: z.string().optional(),
});

const assignSchema = z.object({
  mentor_id: z.string().min(1),
  track_id: z.string().min(1),
  start_idx: z.coerce.number().min(0),
  end_idx: z.coerce.number().min(0),
});

type MentorForm = z.infer<typeof mentorSchema>;
type AssignForm = z.infer<typeof assignSchema>;

export default function MentorsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: mentors, isLoading, isError, refetch } = useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data } = await apiClient.get<Mentor[]>("/admin/mentors");
      return data;
    },
  });

  const { data: tracks } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Track[]>("/admin/tracks");
      return data;
    },
  });

  const mentorForm = useForm<MentorForm>({ resolver: zodResolver(mentorSchema) });
  const assignForm = useForm<AssignForm>({ resolver: zodResolver(assignSchema) });

  const createMutation = useMutation({
    mutationFn: (data: MentorForm) => apiClient.post("/admin/mentors", data),
    onSuccess: () => {
      toast.success("Mentor created");
      mentorForm.reset();
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const assignMutation = useMutation({
    mutationFn: (data: AssignForm) => apiClient.post("/admin/mentors/assign", data),
    onSuccess: () => {
      toast.success("Mentor assigned");
      assignForm.reset();
      setAssignOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Mentors</h1>
          <p className="text-sm text-slate-400">Manage mentor accounts and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAssignOpen(true)}><UserPlus className="h-4 w-4" /> Assign</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add Mentor</Button>
        </div>
      </div>

      {isLoading ? <SkeletonTable /> : (
        <Table
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "emp_id", header: "Employee ID" },
            {
              key: "assignments",
              header: "Assignments",
              render: (row) => row.assignments.map((a) => `${a.start_idx}-${a.end_idx}`).join(", ") || "—",
            },
            {
              key: "is_active",
              header: "Status",
              render: (row) => <Badge variant={row.is_active ? "success" : "danger"}>{row.is_active ? "Active" : "Inactive"}</Badge>,
            },
          ]}
          data={mentors ?? []}
          keyExtractor={(r) => r.id}
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Mentor"
        footer={<Button onClick={mentorForm.handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending}>Create</Button>}>
        <form className="space-y-4">
          <Input label="Name" {...mentorForm.register("name")} error={mentorForm.formState.errors.name?.message} />
          <Input label="Email" type="email" {...mentorForm.register("email")} error={mentorForm.formState.errors.email?.message} />
          <Input label="Employee ID" {...mentorForm.register("emp_id")} error={mentorForm.formState.errors.emp_id?.message} hint="Used as initial password" />
          <Input label="Phone" {...mentorForm.register("phone")} />
        </form>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Mentor"
        footer={<Button onClick={assignForm.handleSubmit((d) => assignMutation.mutate(d))} loading={assignMutation.isPending}>Assign</Button>}>
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Mentor</label>
            <select {...assignForm.register("mentor_id")} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
              <option value="">Select mentor</option>
              {mentors?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Track</label>
            <select {...assignForm.register("track_id")} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm">
              <option value="">Select track</option>
              {tracks?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <Input label="Start Index" type="number" {...assignForm.register("start_idx")} />
          <Input label="End Index" type="number" {...assignForm.register("end_idx")} />
        </form>
      </Modal>
    </div>
  );
}
