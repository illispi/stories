import { Match, Switch } from "solid-js";
import { Item } from "./Item";
import { DoughnutComponent } from "./Doughnut";
import { BarComponent } from "./Bar";
import { TextComponent } from "./Text";
import { YesOrNoComponent } from "./YesOrNo";

export const CompSelector = (props) => {
  return (
    <Switch>
      <Match when={props.type === "stat"}>
        <Item {...props} />
      </Match>
      <Match when={props.type === "doughnut"}>
        <DoughnutComponent {...props} />
      </Match>
      <Match when={props.type === "bar"}>
        <BarComponent {...props} />
      </Match>
      <Match when={props.type === "text"}>
        <TextComponent {...props} />
      </Match>
      <Match when={props.type === "yesOrNo"}>
        <YesOrNoComponent {...props} />
      </Match>
    </Switch>
  );
};
