import { Room } from "@/components/room";

import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface CraftIdPageProps {
  params: {
    craftId: string;
  };
};

const CraftIdPage = ({
  params,
}: CraftIdPageProps) => {
  return (
    <Room roomId={params.craftId} fallback={<Loading />}>
      <Canvas craftId={params.craftId} />
    </Room>
  );
};

export default CraftIdPage;
