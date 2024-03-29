import type { ParentComponent } from "solid-js";

const CssTranstionGrow: ParentComponent<{
  duration?: number;
  visible: boolean;
}> = (props) => {
  return (
    <div
      style={{
        display: "grid",
        "grid-template-rows": `${props.visible ? "1fr" : "0fr"}`,

        transition: `grid-template-rows ${
          props.duration ?? "0.5"
        }s ease-in-out`,
      }}
    >
      <div
        class="flex items-center justify-center"
        style={{
          overflow: "hidden",
          "grid-row": "1 / span 2",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default CssTranstionGrow;
