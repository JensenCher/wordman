import Wordman from "./_components/Wordman";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12">
      <div className="flex w-full max-w-5xl flex-col items-center justify-start">
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="font-exo text-5xl font-bold text-indigo-800"
            style={{ textShadow: "0 5px 4px #bdbdbd" }}
          >
            Wordman
          </div>
          <div className="text font-raleway font-semibold">
            Hangman - replace the Hang
          </div>
        </div>
        <div className="my-8 w-full">
          <Wordman />
        </div>
      </div>
    </main>
  );
}
