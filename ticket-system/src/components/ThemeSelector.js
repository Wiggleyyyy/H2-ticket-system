'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  

  const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();
    const [selectedColorTheme, setSelectedColorTheme] = useState('theme-zinc');
  
    useEffect(() => {
      document.documentElement.classList.remove('theme-zinc', 'theme-red');
      document.documentElement.classList.add(selectedColorTheme);
    }, [selectedColorTheme]);
  
    const handleColorThemeChange = (value) => {
      setSelectedColorTheme(value);
    };
  
    return (
      <div className="flex items-center space-x-4 fixed top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Color theme</Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="rounded-md bg-background shadow-md p-2 text-foreground">
            <DropdownMenuLabel className="text-foreground">Select a theme</DropdownMenuLabel>
            <DropdownMenuSeparator className="border-b border-gray-200 dark:border-gray-600 my-1" />
            
            <DropdownMenuItem
              onClick={() => handleColorThemeChange('theme-zinc')}
              className={`p-2 cursor-pointer ${selectedColorTheme === 'theme-zinc' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              Zinc
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleColorThemeChange('theme-red')}
              className={`p-2 cursor-pointer ${selectedColorTheme === 'theme-red' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              Red
            </DropdownMenuItem>
            {/* Add more color themes as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
  
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    );
  };
  
  export default ThemeSelector;