export default function SettingsItem(props: {
  title: string,
  subtitle?: any,
  grow?: boolean,
  children: any
}) {
  return (
    <div class="flex items-center">
      <div class="min-w-21">
        <h6>{props.title}</h6>
        <div class="text-sm opacity-90">{props.subtitle}</div>
      </div>
      <span class={`${!props.grow ? "grow" : ""} min-w-5`} />
      <span class={`${props.grow ? "grow" : ""} text-right`}>
        {props.children}
      </span>
    </div>
  )
}
