import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  time: string;
  period: string;
  setTime: (time: string) => void;
  setPeriod: (period: string) => void;
}

export function TimeCarousel({ time, setTime }: Props) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);

  React.useEffect(() => {
    if (!api) return;

    const handleSlideChange = () => {
      const currentIndex = api.selectedScrollSnap();
      const newTime = String(currentIndex + 1);
      setTime(newTime);
    };
    handleSlideChange();
    api.on("select", handleSlideChange);
    return () => {
      if (api) {
        api.off("select", handleSlideChange);
      }
    };
  }, [api, setTime]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="w-full max-w-xs mt-12 mb-8"
    >
      <CarouselContent className="-mt-1 h-[100px]">
        {Array.from({ length: 12 }).map((_, index) => (
          <CarouselItem key={index} className="pt-1 md:basis-1/2">
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export function AmPmCarousel({ period, setPeriod }: Props) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);

  React.useEffect(() => {
    if (!api) return;

    const handleSlideChange = () => {
      const currentIndex = api.selectedScrollSnap();
      const newPeriod = currentIndex === 0 ? "AM" : "PM";
      if (newPeriod === "AM") {
        setPeriod("AM");
      } else {
        setPeriod("PM");
      }
    };
    handleSlideChange();
    api.on("select", handleSlideChange);
    return () => {
      if (api) {
        api.off("select", handleSlideChange);
      }
    };
  }, [api, setPeriod]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="w-full max-w-xs mt-12 mb-8"
    >
      <CarouselContent className="-mt-1 h-[100px]">
        {["AM", "PM"].map((periodOption, index) => (
          <CarouselItem key={index} className="pt-1 md:basis-1/2">
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{periodOption}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
