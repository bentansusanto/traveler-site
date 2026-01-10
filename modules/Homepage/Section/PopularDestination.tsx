import Image from "next/image";

const popularDestination = [
  {
    location: "Indonesia",
    image: "bali-destination.jpg"
  },
  {
    location: "Swizerland",
    image: "swiss-destination.jpg"
  },
  {
    location: "Turkey",
    image: "turkey-destination.jpg"
  },
  {
    location: "Japan",
    image: "japan-destination.jpg"
  }
];

export const PopularDestination = () => {
  return (
    <div className="mt-3 px-5 md:px-8 lg:mx-auto lg:max-w-5xl lg:px-0 xl:max-w-[1400px] bg-white md:bg-transparent py-5">
      <div className="mx-auto space-y-2 md:text-center">
        <h1 className="text-lg font-semibold md:text-2xl">Popular Destinations</h1>
        <p className="mx-auto hidden max-w-lg text-gray-500 md:block">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis asperiores non odio
          molestiae.
        </p>
      </div>
      <div className="scrollbar-hide mt-6 flex gap-3 overflow-x-auto md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-4">
        {popularDestination.map((list, idx) => (
          <div
            key={idx}
            className="group relative aspect-[1/1] w-[calc(50vw-1.75rem)] flex-shrink-0 overflow-hidden rounded-md md:w-full">
            <Image
              src={`/images/${list.image}`}
              alt="image-popular-destination"
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
              priority={idx < 2}
            />
            <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/50" />
            <span className="pointer-events-none absolute top-[85%] left-1/2 -translate-x-1/2 font-medium text-white opacity-0 drop-shadow-md transition-all duration-500 ease-out group-hover:top-1/2 group-hover:opacity-100 text-lg">
              {list.location}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
