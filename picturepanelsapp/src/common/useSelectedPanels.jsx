import { useSignalR } from "../signalr/useSignalR";

export function useSelectedPanels(players, setPlayers) {
  useSignalR("SelectPanels", (player) => {
    const newPlayers = { ...players };
    newPlayers[player.id] = player;
    setPlayers(newPlayers);
  });
}
