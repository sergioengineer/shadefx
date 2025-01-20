import { OutputPane } from "./panes/OutputPane";
import { ShaderPane } from "./panes/ShaderPane";

export function ShaderComposer() {
  return (
    <article class="flex flex-col flex-1 w-full overflow-y-auto bg-slate-950">
      <OutputPane />
      <ShaderPane height={300} />
    </article>
  );
}
