import { useCallback, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import getTheme from "./getTheme";
import serverUrl from "../common/ServerUrl";

export function useThemeSounds(gameStateId, volume) {
  const themeSoundsRef = useRef({});

  const playRandomSound = useCallback((sounds) => {
    if (!sounds || sounds.length <= 0) {
      return;
    }
    sounds[Math.floor(Math.random() * sounds.length)].play();
  }, []);

  const playPlayerJoinSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.playerJoinSounds);
  }, [playRandomSound]);

  const playTurnStartSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.turnStartSounds);
  }, [playRandomSound]);

  const playCountdownSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.countdownSounds);
  }, [playRandomSound]);

  const playOpenPanelSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.openPanelSounds);
  }, [playRandomSound]);

  const playTeamReadySound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.teamReadySounds);
  }, [playRandomSound]);

  const playCorrectSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.correctSounds);
  }, [playRandomSound]);

  const playIncorrectSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.incorrectSounds);
  }, [playRandomSound]);

  const playEndGameSound = useCallback(() => {
    playRandomSound(themeSoundsRef.current.endGameSounds);
  }, [playRandomSound]);

  const prepareHowlSounds = useCallback((theme, key) => {
    theme[key]?.forEach((sound) => {
      themeSoundsRef.current[key] = [];
      themeSoundsRef.current[key].push(
        new Howl({
          src: [serverUrl + "themes/" + sound],
        })
      );
    });
  }, []);

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    getTheme(gameStateId, (theme) => {
      if (!theme) {
        return;
      }

      Object.keys(theme).forEach((key) => {
        if (key.indexOf("Sounds") < 0) {
          return;
        }
        prepareHowlSounds(theme, key);
      });
    });
  }, [gameStateId, prepareHowlSounds]);

  useEffect(() => {
    if (!volume) {
      return;
    }
    Howler.volume(volume / 100);
  }, [volume]);

  return {
    playPlayerJoinSound,
    playTurnStartSound,
    playCountdownSound,
    playOpenPanelSound,
    playTeamReadySound,
    playCorrectSound,
    playIncorrectSound,
    playEndGameSound,
  };
}
