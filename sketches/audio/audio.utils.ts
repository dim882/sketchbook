export function getAudioDevices(): Promise<Promise<MediaStream>[]> {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      // console.log(devices);
      const deviceTracks = devices
        .filter((device) => device.label.match(/QuickTime/))
        .sort((a, b) => (a.label < b.label ? -1 : 0));
      return deviceTracks;
    })
    .then((deviceTracks) => {
      // console.log({ deviceTracks });
      const device0 = navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceTracks[0].deviceId } });
      const device1 = navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceTracks[1].deviceId } });

      return [device0, device1];
    });
}
