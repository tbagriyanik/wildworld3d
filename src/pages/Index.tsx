import { GameCanvas } from '@/components/game/GameCanvas';
import { GameUI } from '@/components/game/GameUI';

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <GameCanvas />
      <GameUI />
    </div>
  );
};

export default Index;
