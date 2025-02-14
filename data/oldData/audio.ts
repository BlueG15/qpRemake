type availableName = string;

export default function playAudio(name: availableName, volume: number = 1) {
  if (["cardreverse"].includes(name)) return;

  // name = "cs_hover";

  try {
    const audio = new Audio(window.location.origin + `/audio/${name}.wav`);
    audio.volume = volume;
    audio.play().catch();
  } catch (err) {}
}
