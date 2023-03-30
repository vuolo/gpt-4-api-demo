import { type ChangeEvent, useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { type ChatCompletionResponseMessage } from "openai";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const [response, setResponse] = useState<ChatCompletionResponseMessage>();
  const [imageData, setImageData] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatCompletionMutation = api.openai.chat.useMutation();
  const textInput = "Describe this image.";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = async () => {
    if (!imageData) {
      alert("Please select an image file.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await chatCompletionMutation.mutateAsync({
        text: textInput,
        imageData: imageData.split(",")[1] ?? "",
      });
      console.log(response);
      setResponse(response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>GPT-4 API Demo</title>
        <meta
          name="description"
          content="Testing out my new access to the GPT-4 API!"
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white">
        <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Trying out the <span className="text-purple-300">GPT-4</span> API
          </h1>

          <div className="flex flex-col items-center gap-4 rounded-xl bg-purple-600 p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white">
              Select an image:
            </h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="font-semibold text-purple-900 focus:outline-none"
            />
          </div>

          <h1 className="italic">&quot;{textInput}&quot;</h1>

          <button
            className="transform rounded-xl border-2 border-purple-300 bg-purple-300 px-6 py-2 font-semibold text-purple-800 transition-colors duration-300 ease-in-out hover:border-purple-300 hover:bg-transparent hover:text-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
            onClick={() => void handleButtonClick()}
          >
            Submit
          </button>

          <h2 className="text-2xl font-semibold text-white">Response:</h2>
          {isLoading ? (
            <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-purple-300"></div>
          ) : (
            <pre className="whitespace-pre-wrap text-2xl font-semibold text-white">
              {response
                ? JSON.stringify(response, null, 2)
                : "[No Response Yet]"}
            </pre>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
