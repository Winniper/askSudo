import Link from 'next/link';
import { Button } from './ui/button'
import { PanelRight, MessageCircle } from 'lucide-react';
import Temp from './logout';

const Sidebar = () => {
  return (
    <div className='h-screen w-60 bg-[#171719] flex flex-col'>
      <div className='sticky top-0 z-10'>
        <div className='flex items-center p-4 justify-between'>
          <span className="text-white">askSudo</span>
          <Button>
            <PanelRight />
          </Button>
        </div>
        <div>
          <Link href="#" className='text-white flex gap-2 p-2'>
            <MessageCircle />
            New Chat
          </Link>
        </div>
      </div>
      <div className='flex-1 overflow-w-auto'>
        {/* Render chat here */}
      </div>
      <div className='sticky bottom-0 z-10'>
        <Temp />
      </div>
    </div>
  )
}

export default Sidebar