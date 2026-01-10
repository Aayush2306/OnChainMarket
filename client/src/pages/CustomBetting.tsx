import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { createCustomBetSchema, type CustomBetRound } from "@shared/schema";
import { 
  Clock, 
  Loader2,
  Plus,
  Sparkles,
  Users,
  ArrowRight
} from "lucide-react";

function CreateBetForm() {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(createCustomBetSchema),
    defaultValues: {
      token_ca: "",
      duration: 15,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: { token_ca: string; duration: number }) =>
      api.createCustomBet(values.token_ca, values.duration),
    onSuccess: () => {
      toast({ title: "Custom bet created successfully!" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet/active"] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to create bet";
      toast({ title: message, variant: "destructive" });
    },
  });

  const handleSubmit = (values: { token_ca: string; duration: number }) => {
    createMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Custom Bet
        </CardTitle>
        <CardDescription>
          Create a prediction market for any Solana token with at least $200k market cap
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token_ca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Contract Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Solana token CA"
                      className="font-mono text-sm"
                      {...field}
                      data-testid="input-token-ca"
                    />
                  </FormControl>
                  <FormDescription>
                    The token must be on DexScreener with $200k+ market cap
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
              data-testid="button-create-bet"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Bet"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

interface CustomBetCardProps {
  bet: CustomBetRound;
}

function CustomBetCard({ bet }: CustomBetCardProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = bet.end_time - now;
      setTimeLeft(Math.max(0, remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bet.end_time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <Link href={`/custom/${bet.id}`}>
      <Card className="hover-elevate transition-all cursor-pointer group" data-testid={`custom-bet-${bet.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <Sparkles className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {bet.token_symbol || "Token"}
                </CardTitle>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {bet.token_name}
                </p>
              </div>
            </div>
            <Badge 
              variant={isExpired ? "destructive" : "secondary"}
              className={timeLeft < 60 && !isExpired ? "animate-countdown-pulse" : ""}
            >
              <Clock className="h-3 w-3 mr-1" />
              {isExpired ? "Ended" : formatTime(timeLeft)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">Start Price</p>
              <p className="font-mono font-semibold">${bet.start_price.toFixed(6)}</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">Pool</p>
              <p className="font-mono font-semibold">{bet.total_pool.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Created by @{bet.creator_username}</span>
            <span className="ml-auto">{bet.duration_minutes}m</span>
          </div>

          <Button className="w-full gap-2 group-hover:gap-3 transition-all" disabled={isExpired}>
            {isExpired ? "View Details" : "Trade Now"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActiveBets() {
  const { data: bets = [], isLoading } = useQuery<CustomBetRound[]>({
    queryKey: ["/api/custom-bet/active"],
    queryFn: () => api.getActiveCustomBets() as Promise<CustomBetRound[]>,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2">No Active Custom Bets</p>
          <p className="text-muted-foreground">
            Be the first to create a custom prediction market!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bets.map((bet) => (
        <CustomBetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
}

export default function CustomBetting() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Custom Bets</h1>
          <p className="text-muted-foreground">
            Create or join prediction markets for any Solana token
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" data-testid="tab-active">Active Bets</TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create">Create Bet</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ActiveBets />
          </TabsContent>

          <TabsContent value="create">
            <div className="max-w-md">
              <CreateBetForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
