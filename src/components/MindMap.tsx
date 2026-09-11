import type { MindNode } from "@/lib/types";

export function MindMap({ root }: { root: MindNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max flex-col items-center gap-4 py-2">
        <div className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {root.name}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-start gap-6">
          {(root.children ?? []).map((branch) => (
            <div key={branch.name} className="flex flex-col items-center gap-3">
              <div className="rounded-lg border border-primary/30 bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                {branch.name}
              </div>
              {branch.children?.length ? (
                <>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex flex-col items-center gap-2">
                    {branch.children.map((leaf) => (
                      <div
                        key={leaf.name}
                        className="rounded-md border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                      >
                        {leaf.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
