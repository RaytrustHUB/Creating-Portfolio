import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("Your password will appear here");
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);

  const genPass = (len: number, upper: boolean, nums: boolean, special: boolean) => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numChars = "0123456789";
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    let chars = lower;
    let guaranteedChars: string[] = [];

    if (upper) {
      chars += upperChars;
      guaranteedChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
    }
    if (nums) {
      chars += numChars;
      guaranteedChars.push(numChars[Math.floor(Math.random() * numChars.length)]);
    }
    if (special) {
      chars += specialChars;
      guaranteedChars.push(specialChars[Math.floor(Math.random() * specialChars.length)]);
    }

    if (!upper && !nums && !special) {
      alert("Please select at least one additional character type.");
      return "";
    }

    let pass = "";
    for (let i = 0; i < len - guaranteedChars.length; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }

    pass += guaranteedChars.join("");
    return pass.split("").sort(() => 0.5 - Math.random()).join("");
  };

  const generate = () => {
    if (isNaN(length) || length < 6) {
      alert("Please enter a valid password length (minimum 6).");
      return;
    }
    const pass = genPass(length, includeUpper, includeNumbers, includeSpecial);
    if (pass) {
      setPassword(pass);
    }
  };

  const reset = () => {
    setLength(12);
    setIncludeUpper(true);
    setIncludeNumbers(true);
    setIncludeSpecial(true);
    setPassword("Your password will appear here");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Password Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="length">Password Length:</Label>
            <Input
              id="length"
              type="number"
              min={6}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUpper}
                onCheckedChange={(checked) => setIncludeUpper(checked as boolean)}
              />
              <Label htmlFor="uppercase">Include Uppercase</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              />
              <Label htmlFor="numbers">Include Numbers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="special"
                checked={includeSpecial}
                onCheckedChange={(checked) => setIncludeSpecial(checked as boolean)}
              />
              <Label htmlFor="special">Include Special Characters</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={generate}>Generate Password</Button>
            <Button variant="outline" onClick={reset}>Reset</Button>
          </div>

          <div className="p-4 bg-muted rounded-md text-center break-all">
            {password}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
