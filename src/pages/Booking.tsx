import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Clock, MapPin, User, LogOut } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Club {
  id: string;
  name: string;
  address: string;
}

interface Coach {
  id: string;
  name: string;
  specialty: string;
  club_id: string;
}

interface TimeSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  clubs: { name: string };
  coaches: { name: string; specialty: string };
}

const Booking = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) {
      fetchCoaches(selectedClub);
    }
  }, [selectedClub]);

  useEffect(() => {
    if (selectedClub && selectedCoach && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedClub, selectedCoach, selectedDate]);

  const fetchClubs = async () => {
    const { data, error } = await supabase.from("clubs").select("*").order("name");
    if (error) {
      toast.error("Erreur lors du chargement des clubs");
    } else {
      setClubs(data || []);
    }
  };

  const fetchCoaches = async (clubId: string) => {
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("club_id", clubId)
      .order("name");
    if (error) {
      toast.error("Erreur lors du chargement des coachs");
    } else {
      setCoaches(data || []);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("time_slots")
      .select("*, clubs(name), coaches(name, specialty)")
      .eq("club_id", selectedClub)
      .eq("coach_id", selectedCoach)
      .eq("slot_date", dateStr)
      .eq("status", "available")
      .order("start_time");

    if (error) {
      toast.error("Erreur lors du chargement des créneaux");
    } else {
      setTimeSlots(data || []);
    }
  };

  const handleBooking = async (slotId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        client_id: user.id,
        time_slot_id: slotId,
        status: "confirmed",
      });

      if (error) throw error;

      toast.success("Réservation confirmée!");
      fetchTimeSlots();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Réserver une séance
              </CardTitle>
              <CardDescription>
                Sélectionnez un club, un coach et une date pour voir les créneaux disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Sélectionner un club
                </label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name} - {club.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClub && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary" />
                    Sélectionner un coach
                  </label>
                  <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.name} - {coach.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedCoach && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    Sélectionner une date
                  </label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={fr}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDate && timeSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Créneaux disponibles</CardTitle>
                <CardDescription>
                  {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {timeSlots.map((slot) => (
                    <Card key={slot.id} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slot.coaches.name} - {slot.coaches.specialty}
                          </div>
                        </div>
                        <Button onClick={() => handleBooking(slot.id)} disabled={loading}>
                          Réserver
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDate && timeSlots.length === 0 && selectedCoach && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun créneau disponible pour cette date
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;