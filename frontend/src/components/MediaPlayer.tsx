import { Dynamic, Show } from "solid-js/web"

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "media-controller": any,
      "media-control-bar": any,
      "media-play-button": any,
      "media-time-range": any,
      "media-time-display": any,
      "media-seek-forward-button": any,
      "media-seek-backward-button": any,
      "media-playback-rate-button": any,
      "media-mute-button": any,
      "media-volume-range": any,
      "media-fullscreen-button": any,
    }
  }
}

export default function MediaPlayer(props: {
  audio?: boolean
  src: string,
  defaultRate?: string,
  rates?: string[],
}) {
  return (
    <media-controller audio={props.audio} class="select-none [&_svg]:max-w-none">
      <Dynamic
        component={props.audio ? "audio" : "video"}
        slot="media"
        src={props.src}
        ref={(el: HTMLMediaElement) => {
          if (props.defaultRate) {
            el.playbackRate = parseFloat(props.defaultRate)
          }
        }}
      />
      <media-control-bar>
        <media-play-button class="p-2.5" />
        <media-time-range class="p-2.5" />
        <media-time-display showduration class="p-2.5" />
        <media-seek-forward-button seekoffset="10" class="p-2.5" />
        <media-seek-backward-button seekoffset="10" class="p-2.5" />
        <media-playback-rate-button rates={props.rates?.join(" ")} class="p-2.5" />
        <media-mute-button class="p-2.5" />
        <media-volume-range class="p-2.5 pl-0" />
        <Show when={!props.audio}>
          <media-fullscreen-button class="p-2.5" />
        </Show>
      </media-control-bar>
    </media-controller>
  )
}
