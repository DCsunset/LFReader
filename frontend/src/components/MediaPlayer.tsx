import { MediaControlBar, MediaController, MediaFullscreenButton, MediaMuteButton, MediaPlaybackRateButton, MediaPlayButton, MediaSeekBackwardButton, MediaSeekForwardButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";
import { appState } from "../store/state";

export default function MediaPlayer(props: {
  audio?: boolean
  src: string
}) {
  const mediaProps = { slot: "media", src: props.src };
  // this causes re-render after rates change
  const rates = appState.settings.value.playbackRates;

  return (
    // disable selection to prevent select on double click for mobile devices
    <MediaController audio={props.audio} className="select-none">
      {props.audio
        ? <audio {...mediaProps} />
        : <video {...mediaProps} />}

      <MediaControlBar>
        <MediaPlayButton />
        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaSeekForwardButton seekOffset="10" />
        <MediaSeekBackwardButton seekOffset="10" />
        <MediaPlaybackRateButton ref={(el: any) => {
          // HACK: set attr correctly as Preact doesn't support it well yet
          // See https://github.com/preactjs/preact/issues/4486
          if (rates) {
            el?.setAttribute("rates", rates.join(" "));
          }
          else {
            el?.removeAttribute("rates");
          }
        }} />
        <MediaMuteButton />
        <MediaVolumeRange />
        {!props.audio &&
          <MediaFullscreenButton />}
      </MediaControlBar>
    </MediaController>
  );
}

