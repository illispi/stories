## TODO

- Double check that CSRF stuff, use curl
- Check that scroll restoration works
- Hash username
- clsx
- biome
- Add cloudflare post request rate limiter
- How to make better error page
- Animate articles submit panel
- Vite imagetools
- Show pending status on other and articles
- Page counter still has bug

## Notes

- Test if this .executeTakeFirstOrThrow(); would allow not checking for null in return, unless empty array doesnt throw
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

Maybe this where you have null placeholder bellnotification:

```js
const articlesData = trpc.articlesPagination.createQuery(
  () => ({
    page: page(),
  }),
  () => ({ placeholderData: (prev) => prev })
);
```

### If you have hydration mismatch just add <Suspense>

- Sometimes even reboot helps for that mismatch
