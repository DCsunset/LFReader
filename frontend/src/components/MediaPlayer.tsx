import { MediaControlBar, MediaController, MediaFullscreenButton, MediaMuteButton, MediaPlaybackRateButton, MediaPlayButton, MediaSeekBackwardButton, MediaSeekForwardButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";
import { RefCallback } from "preact";

const playbackRateRefCallback: RefCallback<HTMLElement> = el => {
  // HACK: set attr correctly as Preact doesn't support it well yet
  // See https://github.com/preactjs/preact/issues/4486
  el?.setAttribute("rates", "1.1 1.2 1.3 1.4 1.5 1.75 2");
};

export default function MediaPlayer(props: {
  audio?: boolean
  src: string
}) {
  const mediaProps = { slot: "media", src: props.src };
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
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaSeekForwardButton seekOffset="10" />
        <MediaSeekBackwardButton seekOffset="10" />
        <MediaPlaybackRateButton ref={playbackRateRefCallback as any} />
        {!props.audio &&
          <MediaFullscreenButton />}
      </MediaControlBar>
    </MediaController>
  );
}

