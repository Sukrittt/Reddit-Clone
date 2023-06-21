"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Users } from "lucide-react";
import { Prisma, Subreddit } from "@prisma/client";
import debounce from "lodash.debounce";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/Command";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const router = useRouter();
  const pathname = usePathname();

  const commandRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>("");

  const {
    data: queyrResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];

      const { data } = await axios(`/api/search?q=${input}`);

      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false, //by default it will not fetch
  });

  const request = debounce(() => {
    refetch();
  }, 300);

  const debouncedRequest = useCallback(() => {
    request();
  }, []);

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      ref={commandRef}
      className="hidden md:block relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debouncedRequest();
        }}
        className="outline-none border-none focus:outline-none focus:border-none ring-0"
        placeholder="Search communites..."
      />

      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queyrResults?.length ?? 0) > 0 && (
            <CommandGroup heading="Communites">
              {queyrResults?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  value={subreddit.name}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
