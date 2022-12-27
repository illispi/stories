import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`))
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable("personal_questions")
    .addColumn("answer_personal_id", "serial", (col) => col.primaryKey())
    .addColumn(
      "user_id",
      "uuid",
      (col) =>
        col.references("user.user_id").onDelete("cascade").notNull().unique() //NOTE this should work alas this is child table
    )
    .addColumn(
      "gender",
      "text",
      (col) => col.notNull().check(sql`gender in ('male', 'female', 'other')`) //NOTE check if this actually works first thing.
    )
    .addColumn("current_age", "integer", (col) => col.notNull())
    .addColumn("age_of_onset", "integer", (col) => col.notNull())
    .addColumn("length_of_psychosis", "text", (col) =>
      col
        .notNull()
        .check(
          sql`length_of_psychosis in ('few weeks', 'few months', 'more than 6 months')`
        )
    )
    .addColumn("hospitalized_on_first", "boolean", (col) => col.notNull())
    .addColumn("hospitalized_voluntarily", "boolean", (col) =>
      col.check(
        sql`NOT (hospitalized_on_first AND hospitalized_voluntarily IS NULL) `
      )
    )
    .addColumn("hospital_satisfaction", "boolean", (col) =>
      col.check(
        sql`NOT (hospitalized_on_first AND hospital_satisfaction IS NULL) `
      )
    )
    .addColumn("describe_hospital", "text", (col) =>
      col.check(sql`NOT (hospitalized_on_first AND describe_hospital IS NULL) `)
    )
    .addColumn("care_after_hospital", "boolean", (col) =>
      col.check(
        sql`NOT (hospitalized_on_first AND care_after_hospital IS NULL) `
      )
    )
    .addColumn("what_kind_of_care_after", "text", (col) =>
      col.check(
        sql`NOT (hospitalized_on_first AND care_after_hospital AND what_kind_of_care_after IS NULL) `
      )
    )
    .addColumn("after_hospital_satisfaction", "boolean", (col) =>
      col.check(
        sql`NOT (hospitalized_on_first AND care_after_hospital AND after_hospital_satisfaction IS NULL) `
      )
    )
    .addColumn("psychosis_how_many", "integer", (col) => col.notNull())
    .addColumn("prodromal_symptoms", "boolean", (col) => col.notNull())
    .addColumn(
      "describe_prodromal_symptoms",
      "text",
      (col) =>
        col.check(
          sql`NOT (prodromal_symptoms AND describe_prodromal_symptoms IS NULL) `
        ) //NOTE this IS NULL might be opposite
    )
    .addColumn("symptoms_hallucinations", "boolean")
    .addColumn("symptoms_delusions", "boolean")
    .addColumn("symptoms_paranoia", "boolean")
    .addColumn("symptoms_disorganized", "boolean")
    .addColumn("current_med", "text", (col) =>
      col.notNull().check(
        sql`current_med in ('risperidone (Risperdal)', 'quetiapine (Seroquel)',
           'olanzapine (Zyprexa)', 'ziprasidone (Zeldox)', 'paliperidone (Invega)', 'aripiprazole (Abilify)', 'clozapine (Clozaril)', 'other', 'no medication')`
      )
    )
    .addColumn("efficacy_of_med", "boolean", (col) => col.notNull())
    .addColumn("side_effs_movement_effects", "boolean")
    .addColumn("side_effs_dizziness", "boolean")
    .addColumn("side_effs_weight_gain", "boolean")
    .addColumn("side_effs_sedation", "boolean")
    .addColumn("side_effs_tardive", "boolean")
    .addColumn("side_effs_sexual", "boolean")
    .addColumn("quitting", "boolean", (col) => col.notNull())
    .addColumn("quitting_why", "text", (col) =>
      col
        .check(
          sql`quitting_why in ('side effects', 'felt normal', 'affordability')` //TODO missing "other"
        )
        .check(sql` NOT (quitting AND quitting_why IS NULL)`)
    )
    .addColumn("quitting_what_happened", "text", (col) =>
      col.check(sql`NOT (quitting AND quitting_what_happened IS NULL)`)
    )
    .addColumn("quitting_regret", "boolean", (col) =>
      col.check(sql`NOT (quitting AND quitting_regret IS NULL)`)
    )
    .addColumn("gained_weight", "boolean", (col) => col.notNull())
    .addColumn("weight_amount", "integer", (col) =>
      col.check(sql`NOT (gained_weight AND weight_amount IS NULL)`)
    )
    .addColumn("smoking", "boolean", (col) => col.notNull())
    .addColumn("smoking_amount", "text", (col) =>
      col.check(
        sql`smoking_amount in ('10 a day',
        '20 or more a day',
        'Less than 10 a day',
        'Less than 10 a week')`
      )
    )
    .addColumn("cannabis", "boolean", (col) => col.notNull())
    .addColumn("suicidal_thoughts", "boolean", (col) => col.notNull())
    .addColumn("suicide_attempts", "boolean", (col) =>
      col.check(sql`NOT (suicidal_thoughts AND suicide_attempts IS NULL)`)
    )
    .addColumn("negative_symptoms", "boolean", (col) => col.notNull())
    .addColumn("flat_expressions", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND flat_expressions IS NULL)`)
    )
    .addColumn("poverty_of_speech", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND poverty_of_speech IS NULL)`)
    )
    .addColumn("anhedonia", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND anhedonia IS NULL)`)
    )
    .addColumn("no_interest_socially", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND no_interest_socially IS NULL)`)
    )
    .addColumn("apathy", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND apathy IS NULL)`)
    )
    .addColumn("lack_of_motivation", "boolean", (col) =>
      col.check(sql`NOT (negative_symptoms AND lack_of_motivation IS NULL)`)
    )
    .addColumn("cognitive_symptoms", "boolean", (col) => col.notNull())
    .addColumn("cognitive_symptoms_description", "text", (col) =>
      col.check(
        sql`NOT (cognitive_symptoms AND cognitive_symptoms_description IS NULL)`
      )
    )
    .addColumn("personality_before", "text", (col) => col.notNull())
    .addColumn("personality_changed", "boolean", (col) => col.notNull())
    .addColumn("personality_after", "text", (col) =>
      col.check(sql`NOT (personality_changed AND personality_after IS NULL)`)
    )
    .addColumn("other_help", "text")
    .addColumn("worst_symptom", "text", (col) =>
      col
        .check(
          sql`worst_symptom in ('negative symptoms', 'positive symptoms', 'cognitive symptoms')`
        )
        .notNull()
    )
    .addColumn("life_situation", "text", (col) =>
      col
        .check(
          sql`life_situation in ('unemployed', 'self employed', 'employed', 'disability', 'student', 'other')`
        )
        .notNull()
    )
    .addColumn("partner", "boolean", (col) => col.notNull())
    .addColumn("friends", "boolean", (col) => col.notNull())
    .addColumn("children", "boolean", (col) => col.notNull())
    .addColumn("goals_changed", "boolean", (col) => col.notNull())
    .addColumn("goals_after", "text", (col) =>
      col.check(sql`NOT (goals_changed AND goals_after IS NULL)`)
    )
    .addColumn("told_family", "boolean")
    .addColumn("told_nobody", "boolean")
    .addColumn("told_friends", "boolean")
    .addColumn("told_if_asked", "boolean")
    .addColumn("told_employer", "boolean")
    .addColumn("responded_to_telling", "text", (col) =>
      col.check(sql`NOT (told_nobody AND responded_to_telling IS NULL)`)
    )
    .addColumn("life_satisfaction", "boolean", (col) => col.notNull())
    .addColumn("life_satisfaction_description", "text", (col) =>
      col.check(
        sql`NOT (life_satisfaction AND life_satisfaction_description IS NULL)`
      )
    )
    .addColumn("what_others_should_know", "text")
    .addColumn("not_have_schizophrenia", "boolean", (col) => col.notNull())
    .addColumn("not_have_schizophrenia_description", "text", (col) =>
      col.check(
        sql`NOT (not_have_schizophrenia AND not_have_schizophrenia_description IS NULL)`
      )
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`))
    .execute();

  //TODO add modified_at and created_at and modified_at to these two schemas, also see from gallery web dev instructions

  await db.schema
    .createTable("their_questions")
    .addColumn("answer_their_id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "uuid", (col) =>
      col.references("user.user_id").onDelete("cascade").notNull()
    )
    .addColumn("relation", "text", (col) =>
      col
        .check(sql`relation in ('relative', 'friend', 'acquintance')`)
        .notNull()
    )
    .addColumn(
      "gender",
      "text",
      (col) => col.notNull().check(sql`gender in ('male', 'female', 'other')`) //NOTE check if this actually works first thing.
    )
    .addColumn("age_of_onset", "integer", (col) => col.notNull())
    .addColumn("treatment", "text")
    .addColumn("symptoms_before_onset", "text")
    .addColumn("symptoms_during_psychosis", "text")
    .addColumn("med_efficacy", "boolean")
    .addColumn("side_effects", "text")
    .addColumn("quitting", "boolean")
    .addColumn("smoking", "boolean")
    .addColumn("negative_symptoms", "text")
    .addColumn("personality_before", "text", (col) => col.notNull())
    .addColumn("personality_changed", "boolean", (col) => col.notNull())
    .addColumn("personality_after", "text", (col) =>
      col.check(sql`NOT (personality_changed AND personality_after IS NULL)`)
    )
    .addColumn("life_unemployed", "boolean") //TODO change to like in life_situation in personal questions
    .addColumn("life_disability", "boolean")
    .addColumn("life_employed", "boolean")
    .addColumn("life_student", "boolean")
    .addColumn("partner", "boolean") //NOTE can be null because might not know
    .addColumn("friends", "boolean")
    .addColumn("children", "boolean")
    .addColumn("goals_changed", "boolean", (col) => col.notNull())
    .addColumn("goals_after", "text", (col) =>
      col.check(sql`NOT (goals_changed AND goals_after IS NULL)`)
    )
    .execute();

  //TODO add indexes
  //TODO how do i enforce 1 to 1 relationship for the personal?
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("personal_questions").execute();
  await db.schema.dropTable("their_questions").execute();
  await db.schema.dropTable("user").execute();
}

//NOTE if you added to column name_enum, you could spot them easily in zod schemas.
