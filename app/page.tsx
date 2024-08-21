import Image from "next/image";
import Display from './display/page'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
<Display/>
    </main>
  );
}
