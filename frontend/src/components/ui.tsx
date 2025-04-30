import { splitProps } from "solid-js"

export function IconButton(props: any) {
  const [localProps, restProps] = splitProps(props, ["class"])

  return (
    <button
      class={`d-btn d-btn-ghost d-btn-circle hover:bg-white/15 border-none ${localProps.class}`}
      {...restProps}
    />
  )
}

export function TextButton(props: any) {
  const [localProps, restProps] = splitProps(props, ["class"])

  return (
    <button
      class={`hover:bg-white/15 border-none ${localProps.class}`}
      {...restProps}
    />
  )
}


