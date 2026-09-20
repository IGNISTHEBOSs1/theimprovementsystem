import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  MessageSquare,
  User,
  Settings as SettingsIcon,
  Plus,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { useThemeContext } from "@/providers/ThemeProvider";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: CommandPaletteProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { setMode } = useThemeContext();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback((val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  }, [isControlled, controlledOnOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 size-4 text-muted-foreground" />
            <span>Dashboard</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/quests"))}>
            <CheckSquare className="mr-2 size-4 text-muted-foreground" />
            <span>Quests & Commitments</span>
            <CommandShortcut>G Q</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/journey"))}>
            <Compass className="mr-2 size-4 text-muted-foreground" />
            <span>Journey & Trajectory</span>
            <CommandShortcut>G J</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/mentor"))}>
            <MessageSquare className="mr-2 size-4 text-muted-foreground" />
            <span>The Mentor</span>
            <CommandShortcut>G M</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
            <User className="mr-2 size-4 text-muted-foreground" />
            <span>Profile</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <SettingsIcon className="mr-2 size-4 text-muted-foreground" />
            <span>Settings</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate("/quests"))}>
            <Plus className="mr-2 size-4 text-primary" />
            <span>Make a New Commitment</span>
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => runCommand(() => setMode("light"))}>
            <Sun className="mr-2 size-4 text-muted-foreground" />
            <span>Switch to Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setMode("dark"))}>
            <Moon className="mr-2 size-4 text-muted-foreground" />
            <span>Switch to Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setMode("system"))}>
            <Monitor className="mr-2 size-4 text-muted-foreground" />
            <span>Use System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
