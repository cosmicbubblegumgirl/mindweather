export interface RoomPresence {
  id: string;
  name: string;
  status: string;
  reaction?: string;
  updatedAt: string;
}

const CHANNEL = "mindweather-quiet-rooms";

export const roomService = {
  channel() {
    return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL);
  },
  announce(channel: BroadcastChannel | null, member: RoomPresence) {
    channel?.postMessage({ type: "presence", member });
  },
};
