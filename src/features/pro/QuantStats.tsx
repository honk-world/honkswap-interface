import { FC } from 'react'
import { formatNumber, formatPercent } from '../../functions'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useQuantStats } from '../../context/Pro/hooks'
import { MAX_SUSHI_CLAIMABLE_PER_WEEK } from '../../context/Pro/constants'

const Stat: FC<{ label: string; value: any }> = ({ label, value }) => {
    return (
        <div className="flex flex-col">
            <div className="text-secondary font-bold text-sm">{label}</div>
            <div className="font-bold text-lg text-high-emphesis">{value}</div>
        </div>
    )
}

const ProgressBar: FC<{ percentage: number }> = ({ percentage }) => {
    return (
        <div className="grid relative gap-2">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-dark-1000">
                <div
                    style={{ width: `${percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue to-pink"
                />
            </div>
            <div
                className="text-center font-bold text-xs"
                style={{ width: `${percentage}%` }}
            >
                {formatPercent(percentage)}
            </div>
        </div>
    )
}

const QuantStats = () => {
    const { i18n } = useLingui()
    const { userCount, totalClaimed, totalClaimable } = useQuantStats()

    return (
        <div className="p-4 grid gap-2 draggable overflow-auto">
            <div className="h1 text-high-emphesis font-bold pb-2">
                {i18n._(t`Vested SUSHI statistics`)}
            </div>
            <Stat
                label={i18n._(t`Unique users`)}
                value={formatNumber(userCount)}
            />
            <Stat
                label={i18n._(t`SUSHI claimed until now`)}
                value={formatNumber(totalClaimed)}
            />
            <Stat
                label={i18n._(t`SUSHI claimable until now`)}
                value={formatNumber(totalClaimable)}
            />
            <Stat
                label={i18n._(t`Total SUSHI claimable`)}
                value={formatNumber(
                    MAX_SUSHI_CLAIMABLE_PER_WEEK.reduce((a, b) => a + b, 0)
                )}
            />
            <div className="font-bold text-sm">
                {i18n._(t`Percentage of vested SUSHI claimed until now`)}
            </div>
            <ProgressBar percentage={(totalClaimed / totalClaimable) * 100} />
        </div>
    )
}

export default QuantStats
