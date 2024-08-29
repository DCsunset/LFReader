import { mdiCog, mdiFastForward10, mdiMinus, mdiPlus, mdiRewind10, mdiSpeedometer, mdiSwapHorizontal, mdiVolumeHigh } from "@mdi/js";
import Icon from "@mdi/react";
import { IconButton, ListItem, Menu } from "@mui/material";
import { batch, computed } from "@preact/signals";
import { signal } from "@preact/signals";

const anchorEl = signal<Element|null>(null);
const handleSettingsClick = (event: MouseEvent) => {
  anchorEl.value = event.currentTarget as Element;
};
const handleSettingsClose = () => {
  anchorEl.value = null;
};

const speed = signal(1);
const volume = signal(1);

const speedStr = computed(() => `${speed.value.toFixed(1)}x`);
const volumeStr = computed(() => `${(volume.value * 100).toFixed(0)}%`);

const increaseSpeed = () => {
  const value = Math.min(speed.value + 0.1, 2);
  speed.value = value;
  mediaEl.value!.playbackRate = value;
};
const decreaseSpeed = () => {
  const value = Math.max(speed.value - 0.1, 0.1);
  speed.value = value;
  mediaEl.value!.playbackRate = value;
};
const fastForward = () => {
  mediaEl.value!.currentTime += 10;
};
const rewind = () => {
  mediaEl.value!.currentTime -= 10;
};
const increaseVolume = () => {
  const value = Math.min(volume.value + 0.05, 1);
  volume.value = value;
  mediaEl.value!.volume = value;
};
const decreaseVolume = () => {
  const value = Math.max(volume.value - 0.05, 0);
  volume.value = value;
  mediaEl.value!.volume = value;
};


const mediaEl = signal<HTMLMediaElement|null>(null);
// callback as ref is invoked when ref changes
const mediaRef = (node: HTMLMediaElement | null) => {
  if (node !== null) {
    // initialize states on added
    batch(() => {
      speed.value = node.playbackRate;
      volume.value = node.volume;
      mediaEl.value = node;
    });
  }
};

export default function MediaPlayer(props: {
  video: boolean, // whether to show the video
  children: any // source of the media
}) {

  return (
    <>
      {props.video
        ? <video ref={mediaRef} controls>{props.children}</video>
        : <audio ref={mediaRef} controls>{props.children}</audio>}

      <IconButton onClick={handleSettingsClick} title="Settings">
        <Icon path={mdiCog} size={1} />
      </IconButton>
      <Menu
        anchorEl={anchorEl.value}
        open={Boolean(anchorEl.value)}
        onClose={handleSettingsClose}
        MenuListProps={{
          sx: { minWidth: "240px" }
        }}
      >
        <ListItem className="flex">
          <Icon className="mr-2" path={mdiSpeedometer} size={1} />
          <span>Speed</span>
          <div className="flex grow" />

          <IconButton onClick={decreaseSpeed} title="Decrease 0.1x">
            <Icon path={mdiMinus} size={0.8} />
          </IconButton>
          <span>{speedStr}</span>
          <IconButton onClick={increaseSpeed} title="Increase 0.1x">
            <Icon path={mdiPlus} size={0.8} />
          </IconButton>
        </ListItem>

        <ListItem className="flex">
          <Icon className="mr-2" path={mdiSwapHorizontal} size={1} />
          <span>Seek</span>
          <div className="flex grow" />

          <IconButton onClick={rewind} title="Rewind 10s">
            <Icon path={mdiRewind10} size={0.9} />
          </IconButton>
          <IconButton onClick={fastForward} title="Fast-forward 10s">
            <Icon path={mdiFastForward10} size={0.9} />
          </IconButton>
        </ListItem>

        <ListItem className="flex">
          <Icon className="mr-2" path={mdiVolumeHigh} size={1} />
          <span>Volume</span>
          <div className="flex grow" />

          <IconButton onClick={decreaseVolume} title="Decrease 5%">
            <Icon path={mdiMinus} size={0.8} />
          </IconButton>
          <span>{volumeStr}</span>
          <IconButton onClick={increaseVolume} title="Increase 5%">
            <Icon path={mdiPlus} size={0.8} />
          </IconButton>
        </ListItem>
      </Menu>
    </>
  );
}

