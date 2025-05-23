import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "@clerk/nextjs/server";
import { CarTaxiFront } from "lucide-react";


export const createSnippet = mutation({
    args: {
        title: v.string(),
        language: v.string(),
        code: v.string()
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) //if user is not found, throw an error
            throw new Error("User not authenticated!");
        // if user is found, get the user
        const user = await ctx.db.query("users").withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject)).first;

        if (!user) //if user is not found, throw an error
            throw new Error("User not found!");

        // create the snippet in the snippet table in the db
        const snippetId = await ctx.db.insert("snippets", {
            userId: identity.subject,
            userName: user.name,
            title: args.title,
            language: args.language,
            code: args.code
        });
        return snippetId;
    }
});

export const deleteSnippet = mutation({
    args: {
        snippetId: v.id("snippets"),
    },

    handler: async(ctx,args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("Not Authenticated");

        const snippet = await ctx.db.get(args.snippetId);
        if(!snippet) throw new Error("Snippet not found");

        if(snippet.userId !== identity.subject){
            throw new Error("Not authorized to delete this snippet");
        }

        // If the user is authenticated and the snippet exists and belongs to the user, delete the comments and stars before deleting the snippet
        const comments = await ctx.db.query("snippetComments").withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId)).collect();

        for ( const comment of comments ) {
            await ctx.db.delete(comment._id);
        }

        const stars = await ctx.db.query("stars").withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId)).collect();

        for ( const star of stars ) {
            await ctx.db.delete(star._id);
        }

        await ctx.db.delete(args.snippetId);
    }
});

export const starSnippet = mutation({
    args: {
        snippetId: v.id("snippets"),
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("Not authenticated");

        // check if the star exists or not
        const existing = await ctx.db.query("stars").withIndex("by_user_id_and_snippet_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject) && q.eq(q.field("snippetId"), args.snippetId)).first();
        
        // if already starred, delete the star(clicking again on the star will delete the star) else add star to the snippet
        if(existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("stars", {
                userId: identity.subject,
                snippetId: args.snippetId
            });
        }
    }
});

export const addComment = mutation({
    args: {
        snippetId: v.id("snippets"),
        content: v.string(),
    },
    handler: async (ctx,args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("Not authenticated");

        const user = await ctx.db.query("users").withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject)).first();

        if(!user)
            throw new Error("User not found");
        return await ctx.db.insert("snippetComments",{
            snippetId: args.snippetId,
            userId: identity.subject,
            userName: user.name,
            content: args.content,
        });
    },
});

export const deleteComment = mutation({
    args: {
        commentId: v.id("snippetComments"),
    },
    handler: async (ctx,args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("Not authenticated");

        const comment = await ctx.db.get(args.commentId);
        if(!comment) throw new Error("Comment not found");
    }
});

export const getSnippets = query({
    handler: async(ctx) => {
        const snippets = await ctx.db.query("snippets").order("desc").collect();
        return snippets;
    },
});

export const getSnippetById = query({
    args: { snippetId: v.id("snippets")},
    handler: async (ctx, args) => {
        const snippet = await ctx.db.get(args.snippetId);
        if(!snippet) throw new Error("Snippet not found");

        return snippet;
    }
});

export const getComments = query({
    args: { snippetId: v.id("snippets") },
    handler: async (ctx,args) => {
        const comments = await ctx.db.query("snippetComments").withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId)).order("desc").collect();

        return comments;
    }
})

export const isSnippetStarred = query({
    args: {
        snippetId: v.id("snippets")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) //not starred
            return false;

        const star = await ctx.db.query("stars").withIndex("by_user_id_and_snippet_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject) && q.eq(q.field("snippetId"), args.snippetId)).first();

        return !!star; //to convert the star obj to a boolean value.
    }
});

export const getSnippetStarCount = query({
    args: { snippetId: v.id("snippets") },
    handler: async(ctx, args) => {
        const stars = await ctx.db.query("stars").withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId)).collect();

        return stars.length;
    },
});