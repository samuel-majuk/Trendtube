"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Moon,
  Sun,
  X,
  Menu,
  Mic,
  Sparkles,
  Play,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { getSearchSuggestions } from "@/lib/youtube-api";
import { ThemeSwitcher } from "./theme-switcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
}

const Header = ({ onSearch = () => {} }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const startVoiceSearch = useCallback(() => {
    setVoiceError(null);
    setTranscript("");

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setVoiceDialogOpen(false);
      return;
    }

    try {
      // Browser compatibility check
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceError(
          "Speech recognition is not supported in your browser. Try Chrome or Edge.",
        );
        setVoiceDialogOpen(true);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceDialogOpen(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const speechResult = event.results[current][0].transcript;
        setTranscript(speechResult);

        if (event.results[current].isFinal) {
          setSearchTerm(speechResult);
          setTimeout(() => {
            onSearch(speechResult);
            setVoiceDialogOpen(false);
            setIsListening(false);
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 1000);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setVoiceError(`Error: ${event.error}. Please try again.`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Speech recognition error:", error);
      setVoiceError(
        "Speech recognition failed. Please try again or use text search.",
      );
      setVoiceDialogOpen(true);
    }
  }, [isListening, onSearch]);

  // Fetch search suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        const results = await getSearchSuggestions(searchTerm);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close voice dialog when listening stops
  useEffect(() => {
    if (!isListening && voiceDialogOpen && !voiceError) {
      const timer = setTimeout(() => setVoiceDialogOpen(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, voiceDialogOpen, voiceError]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="w-full px-4 md:px-8 flex h-16 md:h-20 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1.5">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-1.5 rounded-lg shadow-md">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold md:text-2xl hidden sm:block bg-gradient-to-r from-red-500 to-blue-600 bg-clip-text text-transparent">
              TrendTube
            </h1>
          </div>

          {/* Search Form */}
          <div
            ref={searchRef}
            className="relative flex-1 max-w-xl mx-2 sm:mx-4"
          >
            <form onSubmit={handleSearch} className="flex w-full items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hidden sm:block" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search videos..."
                  className="pr-10 pl-4 sm:pl-10 py-2 rounded-l-full rounded-r-none border-r-0 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  autoComplete="off"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => {
                      setSearchTerm("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                variant="default"
                className="rounded-l-none rounded-r-full px-3 sm:px-4 bg-primary/90 hover:bg-primary h-10"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "ml-2 rounded-full flex items-center justify-center h-10 w-10 transition-all duration-200",
                  isListening
                    ? "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 animate-pulse"
                    : "",
                )}
                onClick={startVoiceSearch}
                aria-label="Voice search"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border/40 py-2 px-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Voice Search Dialog */}
      <Dialog open={voiceDialogOpen} onOpenChange={setVoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {voiceError ? "Voice Search Error" : "Listening..."}
            </DialogTitle>
            <DialogDescription>
              {voiceError ? (
                <div className="text-destructive">{voiceError}</div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    {isListening ? (
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping"></div>
                        <div className="relative bg-red-500 text-white p-4 rounded-full">
                          <Mic className="h-8 w-8" />
                        </div>
                      </div>
                    ) : (
                      <Volume2 className="h-8 w-8 text-muted-foreground animate-pulse" />
                    )}
                  </div>
                  <div className="text-center font-medium text-lg">
                    {transcript || "Say something..."}
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {isListening
                      ? "Listening to your voice..."
                      : "Processing your request..."}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 mt-4">
            {voiceError ? (
              <Button onClick={() => setVoiceDialogOpen(false)}>Close</Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  if (recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsListening(false);
                  setVoiceDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
