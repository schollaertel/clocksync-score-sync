// Add this to the signup form state (around line 20)
const [organizationType, setOrganizationType] = useState<'facility' | 'tournament_company' | 'individual'>('individual');

// Update the handleSignup function (around line 50)
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  const { error } = await signUp(signupEmail, signupPassword, fullName, organization, organizationType);
  
  if (error) {
    toast({
      title: "Signup Failed",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Account Created!",
      description: "Please check your email to verify your account.",
    });
  }
  
  setIsLoading(false);
};

// Add this field to the signup form (after organization field, around line 130)
<div className="space-y-2">
  <Label htmlFor="organization-type" className="text-white">Organization Type</Label>
  <select
    id="organization-type"
    value={organizationType}
    onChange={(e) => setOrganizationType(e.target.value as any)}
    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
    required
  >
    <option value="individual" className="text-black">Individual</option>
    <option value="facility" className="text-black">Sports Facility</option>
    <option value="tournament_company" className="text-black">Tournament Company</option>
  </select>
</div>
