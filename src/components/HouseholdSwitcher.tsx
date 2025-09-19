import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import { toast } from "@/hooks/use-toast";

interface Household {
  id: string;
  name: string;
  role: string;
}

export function HouseholdSwitcher() {
  const { user } = useAuth();
  const { household, refetch } = useHousehold();
  const [open, setOpen] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserHouseholds = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('household_memberships')
        .select(`
          household_id,
          role,
          households!inner (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      const householdsList = data?.map(item => ({
        id: item.households.id,
        name: item.households.name,
        role: item.role
      })) || [];

      setHouseholds(householdsList);
    } catch (error) {
      console.error('Error fetching households:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchHousehold = async (householdId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_household_id: householdId })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Switched household",
        description: "Successfully switched to the selected household."
      });

      await refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to switch household",
        description: error.message
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserHouseholds();
    }
  }, [user]);

  if (loading || households.length <= 1) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gradient-to-r from-background to-muted/50 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="truncate">{household?.name || "Select household"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search households..." />
          <CommandList>
            <CommandEmpty>No household found.</CommandEmpty>
            <CommandGroup>
              {households.map((h) => (
                <CommandItem
                  key={h.id}
                  value={h.name}
                  onSelect={() => {
                    if (h.id !== household?.id) {
                      switchHousehold(h.id);
                    }
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      household?.id === h.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {h.role}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}