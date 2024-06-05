## TODO

- Add cloudflare post request rate limiter
- How to make better error page
- Check that valibot still works v.0.31.x, if you update to this
- Figure out how to exclude some routes and components on prod
- index.md
- Protected route redirect
- Only stats page really needs scroll restoration so you could use save scroll pos, see router.ts astro transitions
- Figure out why bell and login status sometimes needs refresh, doesnt seem to happen on build version
- Use vt api on submit for animations
- Hash user and openid without salt
- Test if current route includes to route then dont animate

## Current todo:

- editing for articles and their
- Show pending status on other and articles

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
