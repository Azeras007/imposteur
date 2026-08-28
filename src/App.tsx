import { Home } from './screens/Home';
import { PlayersSetup } from './screens/PlayersSetup';
import { RulesScreen } from './screens/RulesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WordsScreen } from './screens/WordsScreen';
import { GameScreen } from './screens/game/GameScreen';
import { useApp } from './store/AppStore';

export function App() {
  const { screen } = useApp();
  return (
    <div className="app">
      {screen === 'home' && <Home />}
      {screen === 'players' && <PlayersSetup />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'words' && <WordsScreen />}
      {screen === 'rules' && <RulesScreen />}
      {screen === 'game' && <GameScreen />}
    </div>
  );
}
