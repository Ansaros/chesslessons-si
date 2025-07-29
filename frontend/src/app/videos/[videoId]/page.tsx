import { VideosIdView } from "@/modules/videos/ui/views/videos-id-view";

const Page = ({ params }: { params: { id: string } }) => {
    return <VideosIdView params={params} />;
};

export default Page;
