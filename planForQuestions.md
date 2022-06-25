1. patient (a) or relative/friend (b)

Q. Were are you from? Main areas only.

Q. How old are you?
-every 5 years

Q. What is your gender?
single select, male, female, other

Q. What age were you for your first psychosis?
-number field as form, not dropdown menu:
-Just a number as age

Q. How long did the first psychosis last?
-selection:
-few weeks
-few months
-more than 6 months

Q. Were you hosptilized for your first psychosis?
-yes or no

    if(yes):

        Q. Were you voluntarily hospitalized or against your will?
            -yes or no

       Q. were you satisfied with care?
                -yes or no (3aa. 3a1. at the same time on frontend)
            Q. Could you describe your time at hospital?

Q. How many times have you had major psychosis?
-range, once, twice etc.

Q. Did you have prodromal symptoms before you got first psychosis?
-yes or no

    if(yes)

        Q. What kind of prodromal symptoms did you have?

Q. What kind of symptoms did you have on first psychosis?
-Multiple selections: - hallucinations, delusions, paranoia, and disorganized thinking.

            Q. Describe what kind of (delusions | hallucinations...) you had?

Q. Did you recieve care after hospitization?
-yes or no

     if(yes)

        Q. What kind of care, therapy, meetings with psychiatric etc?
            Q. Were you satisfied with after hospitilization care?
                -yes or no

               Q. Why or why not?

Q. What was your main anti-psychotic medications?
-Most used brand and substance names. Multi select, database can see if using multiple meds, since should be one only typically

Q. Did the antipsychotics help to your positive symptoms(psychosis)?
-yes or no

    if(no)
         Q. What kind of symptoms remained and if they were resolved somehow later?

Q. What kind of side effects have the meds had on you?
-multiselect and optional field for free form:
-weight gain, sexual side effects

Q. Have you quit your APs?
-yes or no

    if(yes)
        Q. why?
            -single select, side effects, felt well, didnt believe diagnosis etc.
        Q. What happened after you quit meds? (withdrawal, new psychosis (time))
            -free form
        Q. Do you regret quitting meds (more severe symptoms after etc)
            -yes or no

Q. Have you gained weight on APs?
-yes or no
Q. How much?
-number

Q. Do you smoke tobacco?
-Yes or no

    if(yes)
        Q. How much?
            -single select, amount a day

Q. Have you used cannabis?
-yes or no

Q. Did/Do you have suicidal thoughts?
-yes or no

    if(yes)
        Q. What of attempts?
            -yes or no

Q. Do you have negative symptoms (apathy etc.)?
-yes or no

    if(yes)
        Q. What kind of negative symptoms?
            -multi select, see descriptions

Q. Do you think you have coginitve symptoms?
-yes or no

    if(yes)
        Q. What kind of cogntive symptoms
            -Multiselect, see medical descriptions

Q. What other things you have that help you against illness other than APs.?
-Free form field or select nothing.

Q. What do you think is the worst thing about schizohrenia in itself?
-single select, negative symptoms, positive symptoms, cognitive symptoms
Q. describe the worst symptom.

Q. Did/Do you have other mental ilnessess?
-Multi select:
-Anxiety, depression, Bipolar, autism, alcoholism, drug addiction etc.

Q. What is your life situation?
-Single select, unemployed, disability, working, student

Q. Do you have partner?
-yes or no

Q. Do you have friends?
-yes or no

Q. Do you have children?
-yes or no

Q. Did the goals of your life change after getting ill?
-yes or no

    if(yes)
        Q.How did it change?

Q. Have you told anybody you have schizophrenia?
-multi select, close family, distant family, nobody, friends, acquintances, employer.

    if(not nobody)
        Q. how have they responded to this?

Q. Are you satisified with life?
-yes or no

    Q. Why or why not?
        -free form field

Q. If you could have chosen not to have schizophrenia, would you have?
-yes or no
Q. why or why not, see above?
