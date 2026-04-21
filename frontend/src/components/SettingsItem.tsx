import { concatClasses } from "../util/css"

export default function SettingsItem(props: {
  title: string,
  subtitle?: any,
  grow?: boolean,
  children: any
}) {
  return (
    <div class="flex items-center">
      <div class="min-w-20">
        <h6>{props.title}</h6>
        <div class="text-sm opacity-90">{props.subtitle}</div>
      </div>
      <span class={concatClasses([
        "min-w-4",
        { grow: !props.grow }
      ])} />
      <span class={concatClasses([
        // set min-width to 0 to prevent children from overflowing
        "text-right", "flex", "items-center", "min-w-0", "flex-wrap",
        { grow: props.grow }
      ])}>
        {props.children}
      </span>
    </div>
  )
}
