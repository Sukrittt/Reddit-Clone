import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import Editor from "@/components/Editor";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
  const name = decodeURIComponent(slug);

  const subreddit = await db.subreddit.findFirst({
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in r/{name}
          </p>
        </div>
      </div>

      <Editor subredditId={subreddit.id} />
    </div>
  );
};

export default page;
