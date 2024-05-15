## TODO

- Double check that CSRF stuff
- Some of the choices could have "none of the above" choice
- Prevent same usernames, beware of finding name by spamming it
- Check that scroll restoration works
- Compress images and add srcset
- Make body have only side blue fade and then bottom and up blue fade on element, to prevent jerky blue animation
- Hash username
- clsx
- biome
- Add cloudflare post request rate limiter
- How to make better error page
- Animate articles submit panel

## Notes

- Test if this .executeTakeFirstOrThrow(); would allow not checking for null in return
- When creating new account there is small layout shif

```
Returning immediately allows malicious actors to figure out valid usernames from response times,
 allowing them to only focus on guessing passwords in brute-force attacks.
 As a preventive measure, you may want to hash passwords even for invalid usernames.
 However, valid usernames can be already be revealed with the signup page among other methods.
 It will also be much more resource intensive.
 Since protecting against this is none-trivial,
 it is crucial your implementation is protected against brute-force attacks with login throttling etc.
 If usernames are public, you may outright tell the user that the username is invalid.
```

### If you have hydration mismatch just add <Suspense>

- Sometimes even reboot helps for that mismatch



Fake data doesn't work for texts window

If you have space after username it will create new user. Trim white space in valibot so to speak. Also on backend. On fact don't allow spaces at all

notification if approved or declined, bell icon on nav

Scriptloader