import Header from "@/components/appHeader";
import Sidebar from "@/components/sideBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
    return(
      <div className="min-h-screen flex min-w-full">
        <div className="fixed">
          {/*<Sidebar />*/}
        </div>
        <div>
          <div>
            <Header />
          </div>
          {children}
        </div>
      </div>
    ) 
}