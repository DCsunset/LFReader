import { MediaControlBar, MediaController, MediaFullscreenButton, MediaMuteButton, MediaPlaybackRateButton, MediaPlayButton, MediaSeekBackwardButton, MediaSeekForwardButton, MediaTimeDisplay, MediaTimeRange, MediaVolumeRange } from "media-chrome/react";
// import { MediaPlaybackRateMenu, MediaPlaybackRateMenuButton } from "media-chrome/react/menu";

export default function MediaPlayer(props: {
  audio?: boolean
  src: string
}) {
  const mediaProps = { slot: "media", src: props.src };
  return (
    <MediaController audio={props.audio}>
      {props.audio
        ? <audio {...mediaProps} />
        : <video {...mediaProps} />}

      {/* HACK: not working
      <MediaPlaybackRateMenu rates="1 2 3" hidden anchor="auto" />
        */}

      <MediaControlBar>
        <MediaPlayButton />
        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaSeekForwardButton seekOffset="10" />
        <MediaSeekBackwardButton seekOffset="10" />
        <MediaPlaybackRateButton />
        {/* HACK: not working
        <MediaPlaybackRateMenuButton />
          */}
        {!props.audio &&
          <MediaFullscreenButton />}
      </MediaControlBar>
    </MediaController>
  );
}

