import type {
  CreateDoseMutation,
  CreateDoseInput,
  CreateDoseMutationVariables,
  FindSubstanceBySlug,
  FindSubstanceBySlugVariables,
} from 'types/graphql'

import React from 'react'

import { navigate, routes } from '@cedarjs/router'
import { useMutation, useQuery } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useItemView } from 'src/contexts/ItemViewContext'
import DoseForm from 'src/components/Dose/DoseForm'

const SUBSTANCE_QUERY: TypedDocumentNode<
  FindSubstanceBySlug,
  FindSubstanceBySlugVariables
> = gql`
  query FindSubstanceBySlugOnDose($slug: String!) {
    substance: substanceBySlug(slug: $slug) {
      id
      name
    }
  }
`

const CREATE_DOSE_MUTATION: TypedDocumentNode<
  CreateDoseMutation,
  CreateDoseMutationVariables
> = gql`
  mutation CreateDoseMutation($input: CreateDoseInput!) {
    createDose(input: $input) {
      id
    }
  }
`

type NewDoseProps = {
  slug: string
  currentPageTitle?: string
}

const NewDose = ({ slug, currentPageTitle }: NewDoseProps) => {
  const { setCurrentPageTitle } = useItemView()
  const { data, loading: queryLoading } = useQuery(SUBSTANCE_QUERY, {
    variables: { slug },
  })

  React.useEffect(() => {
    setCurrentPageTitle(currentPageTitle)
  }, [currentPageTitle, setCurrentPageTitle])

  const [createDose, { loading, error }] = useMutation(CREATE_DOSE_MUTATION, {
    onCompleted: () => {
      toast.success('Dose created')
      navigate(routes.doses({ slug }))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: Omit<CreateDoseInput, 'substanceId'>) => {
    if (!data?.substance?.id) return
    createDose({
      variables: {
        input: {
          ...input,
          substanceId: data.substance.id,
        },
      },
    })
  }

  if (queryLoading) return <div>Loading...</div>

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">
          New Dose for {data?.substance?.name || 'Substance'}
        </h2>
        <DoseForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewDose
