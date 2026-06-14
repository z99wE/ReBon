import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Plus, Loader2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Collective() {
  const { isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [whatIfScenario, setWhatIfScenario] = useState("");
  const [selectedCollective, setSelectedCollective] = useState<number | null>(null);

  const myCollectivesQuery = trpc.collective.myCollectives.useQuery(undefined, { enabled: isAuthenticated });
  const publicQuery = trpc.collective.publicList.useQuery();
  const createMutation = trpc.collective.create.useMutation({ onSuccess: () => { toast.success("Collective created!"); setShowCreate(false); setName(""); setDesc(""); myCollectivesQuery.refetch(); }, onError: e => toast.error(e.message) });
  const joinMutation = trpc.collective.join.useMutation({ onSuccess: () => { toast.success("Joined collective!"); setShowJoin(false); setInviteCode(""); myCollectivesQuery.refetch(); }, onError: e => toast.error(e.message) });
  const whatIfMutation = trpc.collective.whatIf.useMutation({ onError: e => toast.error(e.message) });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-purple-400" /> CarbonCollective</h1>
          <p className="text-muted-foreground text-sm mt-1">Pool your reduction efforts with others</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            <button onClick={() => setShowJoin(!showJoin)} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Join</button>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary px-3 py-2 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Create</button>
          </div>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card-glass rounded-xl border border-primary/30 p-5 space-y-3">
          <h3 className="font-bold text-foreground">Create a Collective</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Collective name..." className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)..." rows={2} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none" />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={() => createMutation.mutate({ name, description: desc })} disabled={!name || createMutation.isPending} className="flex-1 btn-primary py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Join Form */}
      {showJoin && (
        <div className="card-glass rounded-xl border border-purple-400/30 p-5 space-y-3">
          <h3 className="font-bold text-foreground">Join with Invite Code</h3>
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="Enter 8-character code..." maxLength={8} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono tracking-widest" />
          <div className="flex gap-2">
            <button onClick={() => setShowJoin(false)} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={() => joinMutation.mutate({ inviteCode })} disabled={inviteCode.length < 4 || joinMutation.isPending} className="flex-1 btn-primary py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
            </button>
          </div>
        </div>
      )}

      {/* My Collectives */}
      {isAuthenticated && myCollectivesQuery.data && myCollectivesQuery.data.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-foreground">My Collectives</h3>
          {myCollectivesQuery.data.map(c => (
            <div key={c.id} className="card-glass rounded-xl border border-purple-400/20 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-foreground">{c.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-400">{c.memberCount} members</div>
                  <div className="text-xs text-muted-foreground">{c.totalCarbonKg?.toFixed(1) ?? 0} kg CO₂</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground">{c.inviteCode}</div>
                <button onClick={() => { navigator.clipboard.writeText(c.inviteCode); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Copy className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {/* What-If Calculator */}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /> What-If Scenario</div>
                <div className="flex gap-2">
                  <input value={selectedCollective === c.id ? whatIfScenario : ""} onChange={e => { setSelectedCollective(c.id); setWhatIfScenario(e.target.value); }} placeholder='e.g. "Everyone goes vegan for a month"' className="flex-1 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground" />
                  <button onClick={() => { setSelectedCollective(c.id); whatIfMutation.mutate({ collectiveId: c.id, scenario: whatIfScenario }); }} disabled={!whatIfScenario || whatIfMutation.isPending} className="px-3 py-1.5 btn-primary rounded-lg text-xs font-semibold">
                    {whatIfMutation.isPending && selectedCollective === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Calculate"}
                  </button>
                </div>
                {whatIfMutation.data && selectedCollective === c.id && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
                    <div className="text-green-400 font-bold">💚 {whatIfMutation.data.totalWeeklyKg?.toFixed(1)} kg CO₂ saved/week collectively</div>
                    <div className="text-muted-foreground">{whatIfMutation.data.equivalent}</div>
                    <div className="text-foreground">{whatIfMutation.data.insight}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Collectives */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground">Public Collectives</h3>
        {publicQuery.data?.length === 0 ? (
          <div className="card-glass rounded-xl border border-border p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No collectives yet. Create the first one!</p>
          </div>
        ) : (
          publicQuery.data?.map(c => (
            <div key={c.id} className="card-glass rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.memberCount} members · {c.totalCarbonKg?.toFixed(1) ?? 0} kg CO₂ tracked</div>
              </div>
              <div className="text-xs text-purple-400 font-mono">{c.inviteCode}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
