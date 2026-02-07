import Header from "@/components/Header";
import AiDoctorRecommendation from "@/components/AiDoctorRecommendation";
import SpecialityMenu from "@/components/SpecialityMenu";
import TopDoctors from "@/components/TopDoctors";
import Banner from '@/components/Banner'

export default function Home() {
  return (
    <div>
      <Header />
      <AiDoctorRecommendation />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
}
