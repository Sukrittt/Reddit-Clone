"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import EditorJS from "@editorjs/editorjs";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Button } from "@/ui/Button";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { PostCreationType, PostValidator } from "@/lib/validators/post";

interface EditorProps {
  subredditId: string;
}

const Editor: FC<EditorProps> = ({ subredditId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationType>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      title: "",
      content: null,
    },
  });

  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  //prevent massive imports on re-renders
  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            shortcut: "CMD+L",
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            shortcut: "CMD+I",
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  const [res] = await uploadFiles([file], "imageUploader");

                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: {
            class: List,
            shortcut: "CMD+SHIFT+L",
          },
          code: {
            class: Code,
            shortcut: "CMD+C",
          },
          inlineCode: {
            class: InlineCode,
            shortcut: "CMD+SHIFT+C",
          },
          table: {
            class: Table,
            shortcut: "CMD+T",
          },
          embed: {
            class: Embed,
            shortcut: "CMD+E",
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef.current?.focus();
      }, 0);
    };
    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost, isLoading } = useMutation({
    mutationFn: async ({ title, content, subredditId }: PostCreationType) => {
      const payload: PostCreationType = { title, content, subredditId };

      const { data } = await axios.post("/api/subreddit/post/create", payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseStatus = error.response?.status;

        if (responseStatus === 400) {
          return toast({
            title: "You are not a member of this subreddit.",
            description: "Join this subreddit in order to post here.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Something went wrong while creating your post.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);

      router.refresh();

      return toast({
        description: "Your post has been published.",
      });
    },
  });

  const onSubmit = async (data: PostCreationType) => {
    const blocks = await ref.current?.save();

    const payload: PostCreationType = {
      title: data.title,
      content: blocks,
      subredditId,
    };

    createPost(payload);
  };

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...rest } = register("title");

  return (
    <>
      <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
        <form
          id="subreddit-post-form"
          className="w-fit"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="prose prose-stone dark:prose-invert">
            <TextareaAutosize
              ref={(e) => {
                titleRef(e);

                //@ts-ignore
                _titleRef.current = e;
              }}
              {...rest}
              placeholder="Title"
              className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
            />
          </div>
          <div id="editor" className="min-h-[200px]" />
        </form>
      </div>
      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="w-full"
          form="subreddit-post-form"
          isLoading={isLoading}
        >
          Post
        </Button>
      </div>
    </>
  );
};

export default Editor;

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  {
    ssr: false,
  }
);

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

export const EditorOutput = (props: { content: any }) => {
  const { content } = props;

  return (
    <Output
      data={content}
      className="text-sm"
      style={style}
      renderers={renderers}
    />
  );
};

function CustomImageRenderer({ data }: any) {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image src={src} alt="editor-content" className="object-contain" fill />
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}
