import { getMusicTrack } from "@/data/music";

type Listener = () => void;

/**
 * Module-level audio controller.
 *
 * Lives outside React so playback can be started directly from the
 * "Start Focus" click (browsers require a user gesture for autoplay), and
 * so the audio element survives client-side navigation into the focus screen.
 */
class MusicPlayerController {
  private audio: HTMLAudioElement | null = null;
  private _trackId: string | undefined;
  private _isPlaying = false;
  private _volume = 0.6;
  private _error = false;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  get trackId(): string | undefined {
    return this._trackId;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get volume(): number {
    return this._volume;
  }

  get error(): boolean {
    return this._error;
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    a.volume = this._volume;
    a.addEventListener("play", () => {
      this._isPlaying = true;
      this._error = false;
      this.emit();
    });
    a.addEventListener("pause", () => {
      this._isPlaying = false;
      this.emit();
    });
    a.addEventListener("error", () => {
      this._error = true;
      this._isPlaying = false;
      this.emit();
    });
    this.audio = a;
    return a;
  }

  async setTrack(id?: string): Promise<void> {
    if (this._trackId === id) return;
    this._trackId = id;
    this._error = false;
    const a = this.ensureAudio();

    if (!id) {
      a.pause();
      a.removeAttribute("src");
      a.load();
      this.emit();
      return;
    }

    const track = getMusicTrack(id);
    if (!track) return;
    a.src = track.audioUrl;
    try {
      await a.play();
    } catch {
      // Autoplay was rejected (e.g. cold restore). The user can press play.
      this.emit();
    }
    this.emit();
  }

  async play(): Promise<void> {
    const a = this.ensureAudio();
    try {
      await a.play();
    } catch {
      // Ignore autoplay rejection — surfaced through the UI as paused.
    }
  }

  pause(): void {
    this.audio?.pause();
  }

  toggle(): void {
    if (this._isPlaying) this.pause();
    else void this.play();
  }

  setVolume(volume: number): void {
    this._volume = volume;
    if (this.audio) this.audio.volume = volume;
    this.emit();
  }

  retry(): void {
    this._error = false;
    if (this._trackId) void this.setTrack(this._trackId);
  }

  stop(): void {
    this.pause();
    if (this.audio) {
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    this._trackId = undefined;
    this._error = false;
    this.emit();
  }
}

export const musicPlayer = new MusicPlayerController();
