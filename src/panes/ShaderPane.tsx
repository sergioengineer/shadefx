import { AiFillFolderAdd } from "solid-icons/ai";
import { allowedExtensions } from "../lib/fileExtensions";

export function ShaderPane(props: { height: number }) {
  let fileInputRef: HTMLInputElement = null as any;

  return (
    <article class={`flex flex-1 flex-col h-${props.height} text-zinc-50`}>
      <header>
        <button
          class="flex items-center gap-1"
          onClick={() => fileInputRef.click()}
        >
          <AiFillFolderAdd />
          Node
          <input
            type="file"
            accept={allowedExtensions}
            ref={fileInputRef}
            onChange={(e) => {
              console.log(e.target.files);
            }}
            class="hidden"
          />
        </button>
      </header>
    </article>
  );
}
